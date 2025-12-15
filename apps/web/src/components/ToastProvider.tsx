import * as Toast from '@radix-ui/react-toast';
import { createContext, ReactNode, useContext, useState } from 'react';

export type ToastMessage = { title: string; description?: string; variant?: 'success' | 'error' };

const ToastContext = createContext<(msg: ToastMessage) => void>(() => {});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<ToastMessage | null>(null);

  const push = (msg: ToastMessage) => {
    setMessage(msg);
    setOpen(false);
    setTimeout(() => setOpen(true), 50);
  };

  return (
    <ToastContext.Provider value={push}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root open={open} onOpenChange={setOpen} className="bg-slate-900 text-white px-4 py-3 rounded shadow-lg border border-slate-700">
          <Toast.Title className="font-semibold">{message?.title}</Toast.Title>
          {message?.description && <Toast.Description className="text-sm text-slate-200">{message.description}</Toast.Description>}
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-4 right-4 w-80" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
