import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FlameIcon, LeafIcon, PinIcon, ShieldIcon } from "@/components/icons";
import { mapsHref } from "@/lib/format";
import { loadStore } from "@/server/menu";

export const metadata: Metadata = {
  title: "About us",
  description: "About this demo of the Pizza Ordering Platform.",
};

const VALUES = [
  { icon: LeafIcon, title: "Live prices", body: "Menu, combos and toppings price themselves as you build, and the server re-checks every order." },
  { icon: FlameIcon, title: "Live kitchen board", body: "Staff accept, prepare and complete orders on a board that updates as orders arrive." },
  { icon: ShieldIcon, title: "Secure by design", body: "Own authentication, rate limits and tests that enforce the security rules on every change." },
];

export default async function AboutPage() {
  const store = await loadStore();
  const address = `${store.addressLine}, ${store.city}, ${store.province} ${store.postalCode}`;
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src="/images/banners/pizza.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
        <div className="container-page relative py-16 sm:py-24">
          <p className="font-display text-xl font-bold text-gold-400">Welcome to Demo Pizzeria</p>
          <h1 className="h-display mt-2 max-w-2xl text-4xl leading-tight sm:text-6xl">A demo of a full restaurant ordering platform</h1>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl space-y-4 text-lg">
          <p>
            Demo Pizzeria is a fictional restaurant. It exists to show the Pizza Ordering Platform working end to end, from a customer
            building an order to the kitchen completing it.
          </p>
          <p>
            The menu, prices, address and phone number are sample data, and no real orders are taken.
          </p>
          <a href={mapsHref(`Demo Pizzeria, ${address}`)} target="_blank" rel="noopener noreferrer" className="card flex items-start gap-3 p-4 text-base hover:bg-brand-50">
            <PinIcon className="mt-0.5 shrink-0 text-brand-700" />
            <span>
              <span className="font-bold">{address}</span>
              {store.landmark && <span className="block text-ink-soft">{store.landmark}</span>}
              <span className="mt-1 block font-semibold text-brand-700 underline underline-offset-4">Get directions</span>
            </span>
          </a>
        </div>
        <Image src="/images/logo.webp" alt="Demo Pizzeria logo" width={400} height={500} className="mx-auto h-72 w-auto" />
      </section>

      <section className="bg-crust py-12">
        <div className="container-page grid gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-6">
              <span className="grid size-12 place-items-center rounded-full bg-brand-600 text-white">
                <Icon />
              </span>
              <h2 className="h-display mt-4 text-2xl">{title}</h2>
              <p className="mt-1 text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
        <div className="container-page mt-10 text-center">
          <Link href="/menu" className="btn btn-primary text-lg">
            See the menu
          </Link>
        </div>
      </section>
    </>
  );
}
