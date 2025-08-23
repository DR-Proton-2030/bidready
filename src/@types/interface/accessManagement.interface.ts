export interface Permission {
  id: number;
  name: string;
  description: string;
  users: number;
  lastUpdated: string;
}

export interface AccessRequest {
  id: number;
  user: string;
  permission: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

export interface Role {
  name: string;
  description: string;
}
