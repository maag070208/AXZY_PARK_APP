export interface ILocation {
  id: number;
  name: string;
  aisle: string;
  spot: string;
  active: boolean;
  entries?: any[];
}

export interface ILocationCreate {
  aisle: string;
  spot: string;
}
