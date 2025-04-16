import { z } from 'zod';

export const signupSchema = z
  .object({
    userName: z
      .string({ message: 'User name is required' })
      .min(2, { message: 'User name must be at least 2 characters' })
      .max(50, { message: 'User name must be at most 50 characters' }),
    email: z.string().email({
      message: 'Invalid email address',
    }),
    password: z
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    confirmationPassword: z
      .string()
      .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  })
  //   .deepPartial()
  //   .optional()
  // .passthrough() //
  .strict() // This is important to ensure that the object has only the specified keys
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmationPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password and confirmation password do not match',
      });
    }
  });

export type CreateSignupDto = z.infer<typeof signupSchema>;
