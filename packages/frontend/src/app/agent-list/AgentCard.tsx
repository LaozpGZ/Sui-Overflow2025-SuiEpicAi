import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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
            <Image
              src={image}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              width={400}
              height={225}
              style={{ width: '100%', height: '100%' }}
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