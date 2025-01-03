import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarFallback>--</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">No data</p>
          <p className="text-sm text-muted-foreground">
            no@email.com
          </p>
        </div>
        <div className="ml-auto font-medium">$0.00</div>
      </div>
    </div>
  );
}
