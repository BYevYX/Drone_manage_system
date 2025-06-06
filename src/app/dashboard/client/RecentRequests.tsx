export default function RecentRequests() {
  const requests = [
    {
      id: 1,
      field: 'Поле №1',
      type: 'Опрыскивание',
      date: '12.05.2023',
      status: 'В работе',
    },
    {
      id: 2,
      field: 'Поле №3',
      type: 'Мониторинг',
      date: '10.05.2023',
      status: 'Завершено',
    },
    {
      id: 3,
      field: 'Поле №2',
      type: 'Десикация',
      date: '08.05.2023',
      status: 'На проверке',
    },
  ];

  const statusColors = {
    'В работе': 'bg-blue-100 text-blue-800',
    Завершено: 'bg-green-100 text-green-800',
    'На проверке': 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {requests.map((request, index) => (
          <li key={request.id}>
            <div className="relative pb-8">
              {index !== requests.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div className="mt-1 flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500">{request.id}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{request.type}</span> на
                      поле <span className="font-medium">{request.field}</span>
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors]}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
