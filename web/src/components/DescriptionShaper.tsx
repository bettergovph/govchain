export function FinancialSummaryCard({ data }) {
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.AMT);

  return (
    <div className="w-full h-full rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {data.UACS_SOBJ_DSC}
      </h3>
      <p className="mt-2 text-4xl font-bold tracking-tight text-green-700 dark:text-green-400">
        {formattedAmount}
      </p>
      <br />
      <hr />
      <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
        {data.DSC}
      </p>
      <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
        {data.UACS_DPT_DSC}
      </p>
    </div>
  );
}

export function HierarchicalCard({ data }) {
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.AMT);

  return (
    <div className="w-full divide-y divide-gray-200 rounded-lg bg-white shadow-xl dark:bg-gray-800 dark:divide-gray-700">
      <div className="p-5">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {data.UACS_DPT_DSC}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.UACS_AGY_DSC}</p>
      </div>
      <div className="p-5">
        <h3 className="font-medium text-gray-900 dark:text-white">Program</h3>
        <p className="mt-1 text-gray-700 dark:text-gray-300">{data.DSC}</p>
        <h3 className="mt-4 font-medium text-gray-900 dark:text-white">Operating Unit</h3>
        <p className="mt-1 text-gray-700 dark:text-gray-300">{data.UACS_OPER_DSC}</p>
      </div>
      <div className="flex items-center justify-between p-5 bg-green-50 dark:bg-green-900/20">
        <div>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {data.UACS_EXP_DSC}
          </span>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{data.UACS_SOBJ_DSC}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formattedAmount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
        </div>
      </div>
    </div>
  );
}

export function DetailListCard({ data }) {
  const fields = [
    { label: 'Department', value: data.UACS_DPT_DSC },
    { label: 'Agency', value: data.UACS_AGY_DSC },
    { label: 'Program', value: data.DSC },
    { label: 'Operating Unit', value: data.UACS_OPER_DSC },
    { label: 'Expense Type', value: data.UACS_EXP_DSC },
    { label: 'Expense Object', value: data.UACS_SOBJ_DSC },
    { label: 'Fund Source', value: data.UACS_FUNDSUBCAT_DSC },
  ];
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.AMT);

  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
      <div className="bg-gray-50 px-4 py-4 dark:bg-gray-700/50">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Transaction Details (ID: {data.PREXC_FPAP_ID})
        </h3>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
          {fields.map((field) => (
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4" key={field.label}>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{field.label}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 dark:text-white">
                {field.value}
              </dd>
            </div>
          ))}
          <div className="bg-green-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 dark:bg-green-900/20">
            <dt className="text-sm font-bold text-gray-800 dark:text-gray-200">Amount</dt>
            <dd className="mt-1 text-lg font-bold text-green-700 sm:col-span-2 sm:mt-0 dark:text-green-400">
              {formattedAmount}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
