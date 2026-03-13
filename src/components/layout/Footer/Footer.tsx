import { EnvelopeIcon } from "@heroicons/react/20/solid";
import Link from "@docusaurus/Link";
import React from "react";
import { SocialLinks } from "../Header/SocialLinks";
import { FOOTER_NAVIGATION } from "./FOOTER_NAVIGATION";

interface IFooterProps {
  small?: boolean;
}

export const CustomFooter: React.FC<IFooterProps> = ({ small }) => {
  return (
    <footer className="flex flex-col w-full p-6 pt-0 sm:pt-6 sm:px-10 md:px-[70px] md:pb-16 mt-16 xl:mt-20 2xl:mt-32 max-w-360 relative mx-auto">
      {small ? null : (
        <nav className="grid grid-cols-1 lg:grid-cols-8">
          {/* Logo and Email Section */}
          <div className="col-span-1 lg:col-span-3 xl:col-span-2 mb-6 lg:mb-0 mr-24">
            <Link
              className="flex items-center text-white text-[16px] font-medium"
              href="/"
            >
              <img
                src="/images/header_logo.svg"
                alt="Permguard"
                className="mr-1 h-11"
              />
            </Link>
            {/*<!-- End of HubSpot code snippet -->*/}
            <div className="flex items-center mt-6">
              <div>
                <EnvelopeIcon width={25} />
              </div>
              <Link
                href="mailto:opensource@permguard.com"
                className="text-white ml-4 -mt-2.5 text-sm font-medium"
              >
                opensource@permguard.com
              </Link>
            </div>
            <div className="relative items-center gap-6 mt-5  flex">
              <SocialLinks />
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 lg:col-span-5 xl:col-span-6 grid grid-cols-1 sm:grid-cols-8 gap-5 sm:gap-6 flex-1">
            {FOOTER_NAVIGATION.map((el) => (
              <nav
                key={el.title}
                className="col-span-6 sm:col-span-4 lg:col-span-2"
              >
                <h3 id="nav0" className="text-white text-sm mb-8 font-bold">
                  {el.title}
                </h3>
                <ul className="flex flex-col gap-4 mt-6">
                  {el.links.map((link) => (
                    <li key={link.href}>
                      {/* TODO: Return bacl Link component when pages are implemented */}
                      {/* Current implementation prevents build fail because of unexistent pages referrence */}
                      <a
                        className="text-sm text-[#A1A1AA] font-medium"
                        href={link.href}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </nav>
      )}

      {/* Legal Notice */}
      <div className="flex flex-col md:flex-row justify-between gap-2 mt-10">
        <p className="text-white text-sm font-medium mb-0">
          Permguard® is a registered trademark.
        </p>
        <p className="text-white text-sm font-medium mb-0 mt-4 md:mt-0">
          Brought to you by{" "}
          <Link
            className="text-white hover:text-fuchsia-500"
            target="_blank"
            href="https://www.nitroagility.com/"
            rel="noreferrer"
          >
            Nitro Agility S.r.l.
          </Link>
        </p>
      </div>

      <div className="mt-8 text-xs leading-5 text-gray-40  md:mt-8">
        <>
          <p>&copy; {new Date().getFullYear()} All rights reserved</p>
        </>
      </div>
    </footer>
  );
};
