import type { CollectionConfig } from 'payload'

const isAuth = ({ req }: any) => !!req.user

export const Members: CollectionConfig = {
  slug: 'members',
  access: { read: isAuth, create: isAuth, update: isAuth, delete: isAuth },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'membershipType', 'gender', 'status', 'expiresAt'],
  },
  fields: [
    { name: 'fullName', type: 'text', required: true },
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'phone', type: 'text' },
    {
      name: 'gender',
      type: 'select',
      required: true,
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Prefer not to say', value: 'other' },
      ],
    },
    { name: 'dateOfBirth', type: 'date' },
    {
      name: 'membershipType',
      type: 'select',
      required: true,
      options: [
        { label: 'Adult Male — £130/yr', value: 'adult_male' },
        { label: 'Adult Female — £65/yr', value: 'adult_female' },
        { label: 'Junior (Under 18) — £40/yr', value: 'junior' },
        { label: 'Student (18–25) — £40–65/yr', value: 'student' },
        { label: 'Senior Citizen (55+) — £40/yr', value: 'senior' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending Payment', value: 'pending' },
        { label: 'Expired', value: 'expired' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    { name: 'joinedAt', type: 'date' },
    { name: 'expiresAt', type: 'date' },
    {
      name: 'codeOfConductSigned',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: { readOnly: true, description: 'Auto-filled on first payment' },
    },
    { name: 'notes', type: 'textarea' },
  ],
}
