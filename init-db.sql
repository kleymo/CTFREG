/*
Created: 22.06.2026
Modified: 23.06.2026
Model: PostgreSQL 12
Database: PostgreSQL 12
*/

-- Create tables section -------------------------------------------------

-- Table Team

CREATE TABLE Team
(
  Name Text NOT NULL,
  TeamId Serial NOT NULL,
  University VARCHAR,
  Email VARCHAR,
  City VARCHAR,
  Phone VARCHAR,
  PhotoURL Text,
  EventId Integer NOT NULL,
  id Integer UNIQUE,
  UserId Integer NOT NULL,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship2 ON Team (EventId)
;

CREATE INDEX IX_Relationship5 ON Team (id)
;

CREATE INDEX IX_Relationship8 ON Team (UserId)
;

ALTER TABLE Team ADD CONSTRAINT PK_Team PRIMARY KEY (TeamId)
;

-- Table Event

CREATE TABLE Event
(
  Name Text NOT NULL,
  Description Text,
  DateStart Date,
  EndDate Date,
  PhotoURL Text,
  EventId Serial NOT NULL,
  UserId Integer NOT NULL,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship9 ON Event (UserId)
;

ALTER TABLE Event ADD CONSTRAINT PK_Event PRIMARY KEY (EventId)
;

-- Table Users

CREATE TABLE Users
(
  UserId Serial NOT NULL,
  Login Text NOT NULL UNIQUE,
  PasswordHash Text NOT NULL,
  Role Text DEFAULT 'user' CHECK (Role IN ('user', 'moderator', 'admin')),
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

ALTER TABLE Users ADD CONSTRAINT PK_Users PRIMARY KEY (UserId)
;

-- Table TeamIntro

CREATE TABLE TeamIntro
(
  Name VARCHAR NOT NULL,
  id Serial NOT NULL,
  University VARCHAR,
  Email VARCHAR,
  City VARCHAR,
  Phone VARCHAR,
  PhotoURL Text,
  UserId Integer NOT NULL,
  EventId Integer NOT NULL REFERENCES Event(EventId) ON DELETE CASCADE,
  Status VARCHAR(20) DEFAULT 'pending' CHECK (Status IN ('pending', 'approved', 'rejected')),
  Comment Text,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)

WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship4 ON TeamIntro (UserId);
CREATE INDEX IX_TeamIntro_EventId ON TeamIntro (EventId);


ALTER TABLE TeamIntro ADD CONSTRAINT PK_TeamIntro PRIMARY KEY (id)
;

-- Table Results

CREATE TABLE Results
(
  EventId Integer NOT NULL,
  TeamId Integer NOT NULL,
  Score Integer DEFAULT 0,
  Result_id Serial NOT NULL,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship3 ON Results (EventId)
;

CREATE INDEX IX_Relationshipp1 ON Results (TeamId)
;

ALTER TABLE Results ADD CONSTRAINT PK_Results PRIMARY KEY (Result_id)
;

ALTER TABLE Results ADD CONSTRAINT UQ_Results_Event_Team UNIQUE (EventId, TeamId)
;

-- Table Developers

CREATE TABLE Developers
(
  Dev_id Serial NOT NULL,
  Name Text NOT NULL,
  PhotoURL Text,
  Information Text NOT NULL,
  EventId Integer NOT NULL,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship6 ON Developers (EventId)
;

ALTER TABLE Developers ADD CONSTRAINT PK_Developers PRIMARY KEY (Dev_id)
;

-- Table Organizers

CREATE TABLE Organizers
(
  Org_id Serial NOT NULL,
  Role Text,
  Name Text,
  PhotoURL Text,
  Link Text,
  EventId Integer NOT NULL,
  Created_at Timestamp DEFAULT CURRENT_TIMESTAMP,
  Updated_at Timestamp DEFAULT CURRENT_TIMESTAMP
)
WITH (
  autovacuum_enabled=true)
;

CREATE INDEX IX_Relationship7 ON Organizers (EventId)
;

ALTER TABLE Organizers ADD CONSTRAINT PK_Organizers PRIMARY KEY (Org_id)
;

-- Create foreign keys (relationships) section -------------------------------------------------

ALTER TABLE TeamIntro
  ADD CONSTRAINT FK_TeamIntro_User
    FOREIGN KEY (UserId)
    REFERENCES Users (UserId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Team
  ADD CONSTRAINT FK_Team_User
    FOREIGN KEY (UserId)
    REFERENCES Users (UserId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Event
  ADD CONSTRAINT FK_Event_User
    FOREIGN KEY (UserId)
    REFERENCES Users (UserId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Team
  ADD CONSTRAINT FK_Team_TeamIntro
    FOREIGN KEY (id)
    REFERENCES TeamIntro (id)
      ON DELETE SET NULL
      ON UPDATE NO ACTION
;

ALTER TABLE Team
  ADD CONSTRAINT FK_Team_Event
    FOREIGN KEY (EventId)
    REFERENCES Event (EventId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Results
  ADD CONSTRAINT FK_Results_Event
    FOREIGN KEY (EventId)
    REFERENCES Event (EventId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Results
  ADD CONSTRAINT FK_Results_Team
    FOREIGN KEY (TeamId)
    REFERENCES Team (TeamId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Developers
  ADD CONSTRAINT FK_Developers_Event
    FOREIGN KEY (EventId)
    REFERENCES Event (EventId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;

ALTER TABLE Organizers
  ADD CONSTRAINT FK_Organizers_Event
    FOREIGN KEY (EventId)
    REFERENCES Event (EventId)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
;