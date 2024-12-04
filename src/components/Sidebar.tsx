import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Home, Key, Building2, Users, Bell, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Tableau de bord', to: '/', icon: Home },
  { name: 'Propriétés', to: '/properties', icon: Building2 },
  { name: 'Clés', to: '/keys', icon: Key },
  { name: 'Fournisseurs', to: '/suppliers', icon: Users },
  { name: 'Alertes', to: '/alerts', icon: Bell },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const NavItems = () => (
    <nav className="p-4 space-y-1">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          onClick={() => onClose()}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg',
              isActive
                ? 'bg-blue-50 text-locimo-blue'
                : 'text-gray-700 hover:bg-gray-50'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <div className="hidden md:block fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
        <NavItems />
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fermer le menu</span>
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4">
                    <span className="text-2xl font-bold text-locimo-blue">
                      Locimo Services
                    </span>
                  </div>
                  <NavItems />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}