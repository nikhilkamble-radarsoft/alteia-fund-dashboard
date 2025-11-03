export const sampleColumns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

export const sampleData = [
  {
    _id: 1,
    title: "IIA CENTER ELECTION FOR TERM 2023 - 2026",
    date: "12-03-2026",
    status: "Active",
    positions: [
      {
        _id: 1,
        name: "Chairman",
        nominations: [{ _id: 1, name: "Alice Johnson" }],
      },
      {
        _id: 2,
        name: "Vice Chairman",
        nominations: [{ _id: 2, name: "Bob Smith" }],
      },
    ],
  },
  {
    _id: 2,
    title: "IIA WESTERN REGION ELECTION 2025 - 2028",
    date: "11-12-2025",
    status: "Inactive",
    positions: [
      {
        _id: 1,
        name: "President",
        nominations: [
          { _id: 1, name: "Carlos Mendes" },
          { _id: 2, name: "Sophia Zhang" },
        ],
      },
      {
        _id: 2,
        name: "Secretary",
        nominations: [{ _id: 3, name: "Ethan Walker" }],
      },
    ],
  },
  {
    _id: 3,
    title: "IIA NORTHERN CHAPTER ELECTION 2024 - 2027",
    date: "11-01-2025",
    status: "Draft",
    positions: [
      {
        _id: 1,
        name: "Chairperson",
        nominations: [
          { _id: 1, name: "Priya Sharma" },
          { _id: 2, name: "David Lee" },
        ],
      },
      {
        _id: 2,
        name: "Treasurer",
        nominations: [{ _id: 3, name: "Oliver Brooks" }],
      },
    ],
  },
  {
    _id: 4,
    title: "IIA SOUTHERN DIVISION ELECTION 2025 - 2028",
    date: "02-12-2025",
    status: "Completed",
    positions: [
      {
        _id: 1,
        name: "Regional Head",
        nominations: [{ _id: 1, name: "Fatima Noor" }],
      },
      {
        _id: 2,
        name: "Joint Secretary",
        nominations: [
          { _id: 2, name: "Noah Kim" },
          { _id: 3, name: "Amira Patel" },
        ],
      },
    ],
  },
  {
    _id: 5,
    title: "IIA YOUNG ARCHITECTS FORUM ELECTION 2025 - 2027",
    date: "02-02-2025",
    status: "Active",
    positions: [
      {
        _id: 1,
        name: "Coordinator",
        nominations: [
          { _id: 1, name: "Liam O’Connor" },
          { _id: 2, name: "Elena Rossi" },
        ],
      },
      {
        _id: 2,
        name: "Deputy Coordinator",
        nominations: [{ _id: 3, name: "Jason Miller" }],
      },
    ],
  },
  {
    _id: 6,
    title: "IIA CENTRAL COMMITTEE ELECTION 2026 - 2029",
    date: "09-15-2026",
    status: "Upcoming",
    positions: [
      {
        _id: 1,
        name: "Chairman",
        nominations: [
          { _id: 1, name: "Rajesh Gupta" },
          { _id: 2, name: "Nina Thomas" },
        ],
      },
      {
        _id: 2,
        name: "Vice Chairman",
        nominations: [{ _id: 3, name: "George Patel" }],
      },
      {
        _id: 3,
        name: "Treasurer",
        nominations: [{ _id: 4, name: "Isabella Cruz" }],
      },
    ],
  },
];
