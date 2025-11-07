// app/components/PlantCard.tsx
interface PlantCardProps {
  name: string;
  description?: string;
  price: number;
}

export default function PlantCard({ name, description, price }: PlantCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{name}</h3>
      {description && <p className="text-gray-600 mb-2">{description}</p>}
      <p className="text-green-700 font-semibold">${price.toFixed(2)}</p>
    </div>
  );
}
