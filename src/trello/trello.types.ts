export interface TrelloUser {
  id: string;
  idBoards: string[];
  fullName: string;
}

export interface TrelloBoardListType {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
}

export interface TrelloCardType {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  idMembers: string[];
  idList: string;
}

export interface TrelloBoardMember {
  id: string;
  fullName: string;
  username: string;
}
