import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa6";

type SocialLinkIconProps = {
  url: string;
};

function getPlatform(url: string) {
  const lower = url.toLowerCase();

  if (lower.includes("instagram.com")) {
    return {
      label: "Instagram",
      icon: <FaInstagram className="h-5 w-5" />,
    };
  }

  if (lower.includes("facebook.com")) {
    return {
      label: "Facebook",
      icon: <FaFacebook className="h-5 w-5" />,
    };
  }

  if (lower.includes("tiktok.com")) {
    return {
      label: "TikTok",
      icon: <FaTiktok className="h-5 w-5" />,
    };
  }

  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return {
      label: "YouTube",
      icon: <FaYoutube className="h-5 w-5" />,
    };
  }

  if (lower.includes("x.com") || lower.includes("twitter.com")) {
    return {
      label: "X",
      icon: <FaXTwitter className="h-5 w-5" />,
    };
  }

  if (lower.includes("linkedin.com")) {
    return {
      label: "LinkedIn",
      icon: <FaLinkedin className="h-5 w-5" />,
    };
  }

  return {
    label: "Website",
    icon: <FaGlobe className="h-5 w-5" />,
  };
}

export default function SocialLinkIcon({ url }: SocialLinkIconProps) {
  const platform = getPlatform(url);

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm font-semibold text-amber-500 transition hover:border-amber-600 hover:text-amber-400"
    >
      {platform.icon}
      <span>{platform.label}</span>
    </Link>
  );
}
