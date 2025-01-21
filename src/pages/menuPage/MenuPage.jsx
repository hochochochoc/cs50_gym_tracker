import React from "react";
import { Calendar, User, ClipboardList, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MenuCard = ({ title, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="group flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:bg-blue-50 hover:shadow-xl"
  >
    <Icon className="mb-3 h-8 w-8 text-gray-600 transition-colors group-hover:text-gray-700" />
    <span className="text-lg font-medium text-gray-800 group-hover:text-gray-900">
      {title}
    </span>
  </div>
);

export default function MenuPage() {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Calendar", icon: Calendar },
    { title: "Profile", icon: User },
    { title: "Plans", icon: ClipboardList },
    { title: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      <header className="bg-gray-700 p-4 shadow-md">
        <h1 className="text-center text-2xl font-bold text-white">Menu</h1>
      </header>

      <main className="container mx-auto max-w-6xl p-4 md:mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => (
            <MenuCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              onClick={() => navigate(`/${item.title.toLowerCase()}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
