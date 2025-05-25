import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface AgentCardProps {
  image: string;
  name: string;
  price: string | number;
  description: string;
}

const AgentCard: React.FC<AgentCardProps> = ({
  image,
  name,
  price,
  description,
}) => {
  return (
    <Link href={`/agent-detail/${encodeURIComponent(name)}`} passHref legacyBehavior>
      <a className="block group focus:outline-none focus:ring-2 focus:ring-primary">
        <Card className="overflow-hidden border border-border bg-background transition-all hover:shadow-md group-hover:shadow-lg cursor-pointer">
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <span className="font-medium text-primary">{price}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export default AgentCard; 