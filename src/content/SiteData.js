// SiteData.js
import Logo from "@/assets/astro.svg"

export const SiteData = {
    title: "Griffins Site",
    description: "This is a site for Griffin to sit down and learn astro.js and start his journey of going pro",
    logo: {
        src: Logo,
        alt: "Griffin's logo",
    }
}

export const ContactData = {
    email: "griffinswebservices@gmail.com",
    phone: "732-939-1309",
}

export const SocialData = [
    {
        title: "Twitter",
        href: "https://twitter.com/griffin",
        icon: "twitter",
    },
    {
        title: "LinkedIn",
        href: "https://linkedin.com/griffin",
        icon: "linkedin",
    },
]