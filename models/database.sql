create TABLE users(
  "id" SERIAL4 PRIMARY KEY,
  "firstname" TEXT,
  "lastname" TEXT,
  "email" TEXT NOT NULL ,
  "password" TEXT NOT NULL ,
  "ts" TIMESTAMPTZ, 
  "usertype_id" INT2,
  "promo" BOOLEAN DEFAULT true,
  "avatar" TEXT,
  "confirm" BOOLEAN DEFAULT false,
  "archive" BOOLEAN DEFAULT false
);

create TABLE user_types(
  "id" SERIAL4 PRIMARY KEY,
  "usertype" TEXT NOT NULL,
);

create TABLE procedures(
  "id" SERIAL4 PRIMARY KEY,
  "procedure" TEXT NOT NULL, 
  "proceduretype_id" INT2, 
  "duration" INT2, 
  "cost" INT2, 
  "ts" TIMESTAMPTZ
);

create TABLE procedure_types(
  "id" SERIAL4 PRIMARY KEY,
  "proceduretype" TEXT NOT NULL
);

create TABLE timetable(
  "id" SERIAL4 PRIMARY KEY,
  "procedure_id" INT4, 
  "user_id" INT4, 
  "doctor_id" INT4, 
  "date" DATE, 
  "time" TEXT, 
  "duration" INT2,
  "consultation" BOOLEAN DEFAULT false,   
  "ts" TIMESTAMPTZ
);

create TABLE files(
  "id" SERIAL4 PRIMARY KEY,
  "filename" TEXT NOT NULL, 
  "type" TEXT, 
  "size" INT4, 
  "path" TEXT, 
  "user_id" INT4, 
  "doc_id" INT4, 
  "ts" TIMESTAMPTZ
);

create TABLE notes(
  "id" SERIAL4 PRIMARY KEY,
  "title" TEXT, 
  "note" TEXT NOT NULL, 
  "client_id" INT4, 
  "doctor_id" INT4, 
  "procedure_id" INT4, 
  "archive" BOOLEAN DEFAULT false,  
  "doc_type" INT2,
  "invoice" JSONB,  
  "ts" TIMESTAMPTZ
);

create TABLE messages(
  "id" SERIAL4 PRIMARY KEY,
  "ticket" TEXT, 
  "client_id" INT4,
  "admin_id" INT4,
  "body" JSONB, 
  "status" INT2 DEFAULT 0, -- // 0 - not answered, 1 - answered, 2 - closed
  "archive" BOOLEAN DEFAULT false,  
  "ts" TIMESTAMPTZ
);

