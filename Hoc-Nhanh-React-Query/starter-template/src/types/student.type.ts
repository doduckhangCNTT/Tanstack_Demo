export interface Student {
  id: number
  avatar: string
  last_name: string
  first_name: string
  gender: string
  country: string
  email: string
  btc_address: string
}

export type Students = Pick<Student, 'id' | 'avatar' | 'last_name' | 'email'>[]
