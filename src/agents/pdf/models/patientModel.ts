export interface Patient {
  id: number;
  name: string;
  age: number;
  email: string;
  history: string;
}

export const patients: Patient[] = [
  {
    id: 1,
    name: "Laura Mendez",
    age: 42,
    email: "laura.mendez@example.com",
    history: "Under treatment for generalized anxiety since 2022."
  },
  {
    id: 2,
    name: "Mario Gonzalez",
    age: 55,
    email: "mario.gonzalez@example.com",
    history: "Follow-up for hypertension and mild arrhythmia."
  }
];
