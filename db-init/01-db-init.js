db.users.insertMany([
  {
    "name":"root",
    "email":"root@gmail.biz",
    "password":"$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
    "role":"admin"
  },
  {
    "name":"studentInit",
    "email":"student@gmail.biz",
    "password":"$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
    "role":"student"
  }
])

db.courses.insertMany([
  {
    "subject": "CS",
    "number": "493",
    "title": "Clout Dev",
    "term": "sp19",
    "instructorId": "hessro"
  },
  {
    "subject": "CS",
    "number": "331",
    "title": "Intro to Arbys Inc.",
    "term": "sp19",
    "instructorId": "hessro"
  },
  {
    "subject": "CS",
    "number": "493",
    "title": "CyborgSecurity",
    "term": "sp19",
    "instructorId": "hessro"
  },
  {
    "subject": "CS",
    "number": "881",
    "title": "Cybershoelacess: Loose Ends and How to Tie Them",
    "term": "sp19",
    "instructorId": "hessro"
  },
  {
    "subject": "CS",
    "number": "330",
    "title": "Virtual Gears",
    "term": "sp19",
    "instructorId": "hessro"
  }
])
