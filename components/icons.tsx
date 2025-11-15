import React from 'react';

export const AppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
        <path d="m16 19.5-2.5-2.5 2.5-2.5" />
        <path d="m8 7.5 2.5 2.5-2.5 2.5" />
    </svg>
);


export const UploadIcon: React.FC = () => (
  <svg
    className="w-10 h-10 mb-3 text-slate-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    ></path>
  </svg>
);

export const PdfIcon: React.FC = () => (
  <svg
    className="w-10 h-10 mx-auto text-red-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.5 14.5v-2H11v.5h2v-1c0-.28-.22-.5-.5-.5H11v-1h-1.5V9h-1v1.5H7v1h1.5v1H10v.5h.5c.28 0 .5-.22.5-.5v-1h-1.5v2h-1zm2 1.5H10v-1h1.5v1zm2-5h-1v.5h1v1h-1v.5h1v1h-1v.5h1c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5z" />
  </svg>
);

export const ExcelIcon: React.FC = () => (
  <svg
    className="w-10 h-10 mx-auto text-green-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.88 16.5l-1.44-1.44 1.44-1.44-1.06-1.06-1.44 1.44-1.44-1.44-1.06 1.06 1.44 1.44-1.44 1.44 1.06 1.06 1.44-1.44 1.44 1.44zM18 18h-5v-1h5v1zm0-3h-5v-1h5v1zm0-3h-5v-1h5v1z" />
  </svg>
);

export const CsvIcon: React.FC = () => (
  <svg
    className="w-10 h-10 mx-auto text-sky-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.5 15.5H8v-1h1.5V13h-2v-1.5h2V10h-1.5V9H10v6.5H9.5zM13 14h-1.5v1.5h-1V9H12v5h1v1.5zm3.5-1.5H15v1.5h-1.5V9H15v4h1.5v1.5z"/>
  </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
);

export const SearchIcon: React.FC = () => (
    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
);