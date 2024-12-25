import CheckoutButton from "@/components/CheckoutButton";

export default function SellApronPage() {
  // Price: RM 36.00 => pass 3600 (in cents) to Stripe
  const apronItem = [{ name: "Apron", price: 3600, quantity: 1 }];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buy Our Apron - RM 36.00</h1>
      <p className="mb-6">Get the perfect apron for your cooking adventures!</p>

      <CheckoutButton items={apronItem} />

      <div className="mt-8 p-4 border rounded text-sm text-gray-700">
        <p>
          <strong>Test Card:</strong> 4242 4242 4242 4242 (any future date / any
          3-digit CVC)
        </p>
        <p>
          Use this test card info during checkout to simulate a successful
          payment.
        </p>
      </div>
    </div>
  );
}
