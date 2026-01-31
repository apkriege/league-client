import { nanoid } from "nanoid";
console.log("Generating new league init data...");
console.log("nanoid example:", nanoid());

export const info = {
  adminId: 1,
  name: "Bomb League",
  description: "This is a simple description that will describe the league.",
  numPlayers: 10,
  access: "public",
  contactFirstName: "Adam",
  contactLastName: "Krieger",
  contactEmail: "adamkriger@gmail.com",
  contactPhone: "1234567890",
  startDate: new Date(),
  endDate: new Date(),
};

export const events = [
  {
    courseId: 1,
    teeId: 1,
    name: "Event 1",
    type: "regular", // regular, playoff, championship, off, makeup
    format: "team", // individual, team
    startSide: "front",
    holes: 9,
    date: new Date("2024-02-15"),
    startTime: "4:00 PM",
    interval: 10,
    scoreType: "match",
    ptsPerHole: 1,
    ptsPerMatch: 2,
    ptsPerTeamWin: 3,
    strokePoints: [],
    status: "completed", // scheduled, completed, cancelled
    flights: [
      // these can are a list of player or team ids
      // if they are teams, the players will be auto assigned on the backend
      // ["111FAGUN2dVyQvZ63XdYY", "222FAGUN2dVyQvZ63XdYY"],
      // ["333FAGUN2dVyQvZ63XdYY", "444FAGUN2dVyQvZ63XdYY"],
      // ["555FAGUN2dVyQvZ63XdYY", "666FAGUN2dVyQvZ63XdYY"],
      // ["777FAGUN2dVyQvZ63XdYY", "888FAGUN2dVyQvZ63XdYY"],
    ],
  },
  {
    leagueId: 1,
    courseId: 1,
    teeId: 1,
    name: "Event 2",
    type: "regular", // regular, playoff, championship, off, makeup
    format: "team", // individual, team
    startSide: "front",
    holes: 9,
    date: new Date("2024-03-01"),
    startTime: "4:00 PM",
    interval: 10,
    scoreType: "match",
    ptsPerHole: 1,
    ptsPerMatch: 2,
    ptsPerTeamWin: 3,
    strokePoints: [],
    status: "completed", // scheduled, completed, cancelled
    flights: [
      // these can are a list of player or team ids
      // if they are teams, the players will be auto assigned on the backend
      // ["111FAGUN2dVyQvZ63XdYY", "333FAGUN2dVyQvZ63XdYY"],
      // ["222FAGUN2dVyQvZ63XdYY", "444FAGUN2dVyQvZ63XdYY"],
      // ["555FAGUN2dVyQvZ63XdYY", "777FAGUN2dVyQvZ63XdYY"],
      // ["666FAGUN2dVyQvZ63XdYY", "888FAGUN2dVyQvZ63XdYY"],
    ],
  },
];

export const currTeams = [
  {
    id: 1,
    name: "Team A",
    players: [1, 2],
  },
  {
    id: 2,
    name: "Team B",
    players: [3, 4],
  },
  {
    id: 3,
    name: "Team C",
    players: [5, 6],
  },
  {
    id: 4,
    name: "Team D",
    players: [7, 8],
  },
  {
    id: 5,
    name: "Team E",
    players: [9, 10],
  },
];

export const currPlayers = [
  {
    id: 1,
    first: "Adam",
    last: "Ant",
    email: "adam@ant.com",
    type: "player",
    handicap: 5,
  },
  {
    id: 2,
    first: "Brent",
    last: "Boston",
    email: "brent@boston.com",
    type: "player",
    handicap: 10,
  },
  {
    id: 3,
    first: "Derrick",
    last: "Door",
    email: "derrick@door.com",
    type: "player",
    handicap: 15,
  },
  {
    id: 4,
    first: "Carl",
    last: "Calvin",
    email: "carl@calvin.com",
    type: "player",
    handicap: 20,
  },
  {
    id: 5,
    first: "Ethan",
    last: "Edwards",
    email: "ethan@edwards.com",
    type: "sub",
    handicap: 5,
  },
  {
    id: 6,
    first: "Fred",
    last: "Franklin",
    email: "fred@franklin.com",
    type: "player",
    handicap: 10,
  },
  {
    id: 7,
    first: "Garret",
    last: "Garage",
    email: "garret@garage.com",
    type: "player",
    handicap: 15,
  },
  {
    id: 8,
    first: "Hilary",
    last: "Hiles",
    email: "hilary@hiles.com",
    type: "player",
    handicap: 20,
  },
  {
    id: 9,
    first: "Jimmy",
    last: "James",
    email: "jimmy@james.com",
    type: "player",
    handicap: 10,
  },
  {
    id: 10,
    first: "Kelly",
    last: "Kolton",
    email: "kelly@kolton.com",
    type: "player",
    handicap: 15,
  },
];

export const dates = {
  startDate: new Date(),
  endDate: new Date("06-21-2025"),
  startTime: "4:00",
  daysOfWeek: ["Tuesday"],
  frequency: "weekly",
  offDays: [
    {
      id: 1,
      name: "Amateur Championship",
      date: new Date("12-25-2024"),
    },
    {
      id: 2,
      name: "Champs Week",
      date: new Date("01-01-2025"),
    },
  ],
};

// figure out how to store player matchups
