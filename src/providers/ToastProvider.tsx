"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: 'rgba(74, 222, 128, 0.9)',
            color: '#fff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: 'rgba(248, 113, 113, 0.9)',
            color: '#fff',
          },
        },
      }}
    />
  );
}
