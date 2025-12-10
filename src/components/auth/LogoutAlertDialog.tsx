import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface LogoutAlertDialogProps {
  children: React.ReactNode;
  onConfirm: () => void;
}
export const LogoutAlertDialog: React.FC<LogoutAlertDialogProps> = ({ children, onConfirm }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white">Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            This will log you out and <span className="text-red-400 font-bold">permanently delete</span> all your local progress, high scores, and statistics. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white mt-2 sm:mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700 border-none"
          >
            Yes, Reset & Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};