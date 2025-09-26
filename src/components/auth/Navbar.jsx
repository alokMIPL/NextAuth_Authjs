import Link from "next/link";
import { Button } from "../ui/button";
import { getSession } from "@/lib/getSession";
import { signOut } from "../../../auth";

const Navbar = async () => {

  const session = await getSession();
  console.log("********** nav",session)
  console.log("********** nav",session?.user);

  const user = session?.user;
  console.log(user, "!!!!!!!!!!user in nav")


  return (
    <nav className="flex justify-around items-center py-4 bg-[#141414] text-white">
      <Link href="/" className="text-xl font-bold">
        My Facny Website
      </Link>

      <ul className="hidden md:flex space-x-4 list-none">
        {!user ? (
          <>
            <li>
              <Link href="/login" className="hover:text-gray-400">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-gray-400">
                Register
              </Link>
            </li>
          </>
         ) : (
          <>
            <li className="mt-2">
              <Link href="/private/dashboard" className="hover:text-gray-400">
                Dashboard
              </Link>
            </li>

            {user.role === "admin" && (
              <li className="mt-2">
                <Link href="/private/settings" className="hover:text-gray-400">
                  Settings
                </Link>
              </li>
            )}

            <li className="mt-2">
              <Button type="submit" className="text-black bg-white" variant={"ghost"}>
                <span>{user.name || user.firstname}</span>
                <span className="uppercase" >{user.role}</span>
              </Button>
              
            </li>

            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant={"ghost"}>
                Logout
              </Button>
            </form>
          </>
         )}
      </ul>
    </nav>
  );
};

export default Navbar;