import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full min-h-[200px] bg-lightText dark:bg-gray-900 dark:border-t dark:border-gray-800 font-text">
      <div className="w-full min-h-[160px] flex flex-col md:flex-row">
        <div className="md:w-1/3 w-full flex flex-col justify-center items-center py-5">
          <h2 className="text-lg md:text-3xl font-bold text-white">Subscribe to our newsletter</h2>
          <p className="text-sm text-white px-5 mx-5 font-medium">Get health updates and articles delivered to your inbox.</p>
        </div>
        <div className="md:w-2/3 w-full flex justify-center items-center pb-5 md:pb-0">
          <form onSubmit={(event) => event.preventDefault()} className="flex flex-wrap justify-center gap-2 px-4">
            <input type="email" aria-label="Email address" placeholder="Email" className="px-4 py-3 bg-white rounded focus:outline-none" />
            <button type="submit" className="bg-btn2 px-4 py-3 rounded-lg">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="w-full justify-center items-center flex gap-4 pb-4 text-xs text-white">
        <p className="font-bold">Smart Health FYP</p>
        <Link to="/privacy" className="hover:underline">Privacy</Link>
        <Link to="/terms" className="hover:underline">Terms</Link>
      </div>
    </footer>
  );
}

export default Footer;
