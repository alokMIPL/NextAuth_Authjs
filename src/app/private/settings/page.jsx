import { fetchAllUser } from '@/action/user';
import { getSession } from '@/lib/getSession';
import { User } from '@/models/User';
import { redirect } from 'next/navigation';
import React from 'react'

const Settings = async () => {

  const session = await getSession();
  console.log("********** settings ",session)
  console.log("********** settings",session?.user);

  const user = session?.user;
  if (!user) redirect("/login");

  if(user.role !== "admin") redirect("/private/dashboard");
  
  const allusers = await fetchAllUser();


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">users</h1>
      <table className="w-full rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">First Name</th>
            <th className="p-2">Last Name</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {allusers.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.firstname}</td>
              <td className="p-2">{user.lastname}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <form action={async () => {
                  "use server"
                  await User.findByIdAndDelete(user._id);
                }}>
                  <button className="text-red-500 hover:underline">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Settings