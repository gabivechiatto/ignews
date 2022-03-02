import GitHubProvider from 'next-auth/providers/github';
import NextAuth from "next-auth"

import { query as q } from "faunadb";

import { fauna } from '../../../services/faunadb';

export default NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'read:user',
                },
            },
        })
    ],    
    callbacks: {
        async signIn({user, account, profile}): Promise<boolean> {
            const { email } = user;

            try {
                await fauna.query(
                    q.Let(
                        {
                            userExists: q.Exists(
                                q.Match(
                                    q.Index("user_by_email"),
                                    q.Casefold(user.email)
                                )
                            )
                        },
                        q.If(
                            q.Var('userExists'),
                            q.Get(
                                q.Match(
                                    q.Index('user_by_email'),
                                    q.Casefold(user.email)
                                )
                            ),
                            q.Create(
                                q.Collection('users'),
                                {
                                    data: { email }
                                }
                            )
                        )
                    )
                )

                return true;
            } catch (err){
                return false;
            }
        },
    },
})