"use client";

import {
  Wrench,
  Cog,
  CircleDot,
  BatteryCharging,
  Phone,
  MapPin,
} from "lucide-react";

const features = [
  {
    title: "Genuine Spare Parts",
    description:
      "Reliable automotive parts sourced for quality, durability, and compatibility.",
    icon: Cog,
  },
  {
    title: "Expert Support",
    description:
      "Get guidance on selecting the right part for your vehicle and repairs.",
    icon: Wrench,
  },
  {
    title: "Brake & Suspension",
    description:
      "Quality brake pads, suspension parts, and steering components.",
    icon: CircleDot,
  },
  {
    title: "Electrical Components",
    description:
      "Batteries, sensors, ignition parts, and trusted electrical accessories.",
    icon: BatteryCharging,
  },
];

const stats = [
  { value: "500+", label: "Parts Available" },
  { value: "5+", label: "Vehicle Brands" },
  { value: "3+", label: "Years Serving Customers" },
  { value: "Mon–Sat", label: "Business Hours" },
];

const categories = [
  {
    title: "Engine Components",
    description:
      "Filters, belts, spark plugs, and core engine replacement parts.",
    icon: Cog,
  },
  {
    title: "Suspension Parts",
    description:
      "Shock absorbers, arms, bushings, and alignment components.",
    icon: Wrench,
  },
  {
    title: "Brake System",
    description:
      "Brake pads, discs, calipers, and hydraulic components.",
    icon: CircleDot,
  },
  {
    title: "Electrical Parts",
    description:
      "Battery accessories, sensors, ignition coils, and wiring.",
    icon: BatteryCharging,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              Trusted Auto Parts Supplier
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Reliable Automotive Parts
              <span className="block text-green-700">
                For Everyday Repairs & Maintenance
              </span>
            </h1>

            <p className="max-w-3xl text-lg leading-8 text-gray-600">
              MOgrace Auto Parts supplies genuine and dependable automotive
              spare parts for Hyundai, Kia, Toyota, Lexus, and Honda vehicles.
              We serve mechanics, workshops, fleet owners, and individual
              drivers with quality parts and dependable support.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition hover:bg-green-800">
                Contact Us
              </button>

              <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100">
                View Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Customers Choose Us
          </h2>
          <p className="mt-2 text-gray-600">
            Trusted products, dependable support, and parts you can rely on.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <feature.icon className="mb-4 h-6 w-6 text-green-700" />

              <h3 className="text-base font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900">
              Product Categories
            </h2>
            <p className="mt-2 text-gray-600">
              A wide range of essential automotive parts for maintenance and
              repairs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <item.icon className="h-6 w-6 text-green-700" />

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Need Genuine Auto Parts?
            </h2>

            <p className="mt-3 max-w-2xl text-gray-600">
              Visit our store or reach out to our team for trusted spare parts
              and professional support.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-green-700" />
                <span>463 Oron Road, Uyo</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="h-5 w-5 text-green-700" />
                <span>+234 8169 803 228</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800">
                Visit Store
              </button>

              <button className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}