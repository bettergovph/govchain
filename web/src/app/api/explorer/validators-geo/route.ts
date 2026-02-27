import { NextResponse } from 'next/server';

const BLOCKCHAIN_RPC = process.env.BLOCKCHAIN_NODE || 'http://localhost:26657';
const IP_GEOLOCATION_API = 'http://ip-api.com';

interface ValidatorGeoLocation {
  ip: string;
  lat: number;
  lng: number;
  moniker: string;
  country: string;
  city: string;
  nodeId: string;
}

/**
 * Get validator locations using IP geolocation API
 */
export async function GET() {
  try {
    // Fetch net_info from RPC
    const netInfoResponse = await fetch(`${BLOCKCHAIN_RPC}/net_info`);
    
    if (!netInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch network info' },
        { status: 500 }
      );
    }

    const netInfo = await netInfoResponse.json();
    const peers = netInfo.result?.peers || [];

    // Extract unique IPs from peers
    const validatorIPs = new Set<string>();
    const validatorMap = new Map<string, { moniker: string; nodeId: string }>();

    peers.forEach((peer: any) => {
      const remoteIp = peer.remote_ip;
      if (remoteIp && remoteIp !== '127.0.0.1' && remoteIp !== 'localhost') {
        validatorIPs.add(remoteIp);
        validatorMap.set(remoteIp, {
          moniker: peer.node_info?.moniker || 'Unknown',
          nodeId: peer.node_info?.id || 'unknown',
        });
      }
    });

    // Geolocate each IP using ip-api.com (free, no key required)
    const geolocations: ValidatorGeoLocation[] = [];

    for (const ip of validatorIPs) {
      try {
        const geoResponse = await fetch(`${IP_GEOLOCATION_API}/json/${ip}?fields=status,lat,lon,country,city`);
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          
          if (geoData.status === 'success') {
            const validator = validatorMap.get(ip);
            geolocations.push({
              ip,
              lat: geoData.lat,
              lng: geoData.lon,
              moniker: validator?.moniker || 'Unknown',
              country: geoData.country || 'Unknown',
              city: geoData.city || 'Unknown',
              nodeId: validator?.nodeId || 'unknown',
            });
          }
        }

        // Rate limiting: wait 100ms between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to geolocate IP ${ip}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      count: geolocations.length,
      validators: geolocations,
    });
  } catch (error) {
    console.error('Error fetching validator geolocations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch validator geolocations',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
