import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppState } from "@/contexts/AppStateContext";
import { playCreditReward } from "@/utils/soundEffects";
import { ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STORE_ITEMS = [
  {
    id: "cyberpunk_badge",
    name: "Cyberpunk Badge",
    cost: 50,
    desc: "Unlock a cyberpunk badge for your profile",
    emoji: "🏅",
  },
  {
    id: "elite_theme",
    name: "Elite Theme Unlock",
    cost: 100,
    desc: "Unlock the elite color scheme",
    emoji: "🎨",
  },
  {
    id: "double_cr",
    name: "Double CR Day",
    cost: 75,
    desc: "2x CR earned for the next 24 hours",
    emoji: "⚡",
  },
  {
    id: "avatar_frame",
    name: "Custom Avatar Frame",
    cost: 30,
    desc: "Unique animated frame around your avatar",
    emoji: "🖼️",
  },
];

export default function CRStoreModal() {
  const { todoStats, updateTodoStats } = useAppState();
  const [open, setOpen] = useState(false);
  const [purchased, setPurchased] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cr_store_purchased") ?? "[]");
    } catch {
      return [];
    }
  });

  const handleBuy = (item: (typeof STORE_ITEMS)[0]) => {
    if (todoStats.totalCR < item.cost) {
      toast.error("Insufficient CR", {
        description: `You need ${item.cost} CR to buy this item.`,
      });
      return;
    }
    const newPurchased = [...purchased, item.id];
    setPurchased(newPurchased);
    localStorage.setItem("cr_store_purchased", JSON.stringify(newPurchased));
    updateTodoStats({ totalCR: todoStats.totalCR - item.cost });
    playCreditReward();
    toast.success(`${item.emoji} ${item.name} purchased!`, {
      description: `${item.cost} CR deducted.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          data-ocid="cr-store.open_modal_button"
          size="sm"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 font-mono text-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          CR Store
        </Button>
      </DialogTrigger>
      <DialogContent
        data-ocid="cr-store.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            CR Spending Store
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 px-1 py-2 rounded bg-primary/10 border border-primary/20">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono">
            Balance:{" "}
            <span className="text-primary font-bold">
              {todoStats.totalCR} CR
            </span>
          </span>
        </div>
        <div className="space-y-3 mt-2">
          {STORE_ITEMS.map((item, i) => {
            const owned = purchased.includes(item.id);
            const canAfford = todoStats.totalCR >= item.cost;
            return (
              <div
                key={item.id}
                data-ocid={`cr-store.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono text-primary font-bold">
                    {item.cost} CR
                  </span>
                  {owned ? (
                    <span className="text-xs font-mono text-green-400">
                      OWNED
                    </span>
                  ) : (
                    <Button
                      data-ocid={`cr-store.primary_button.${i + 1}`}
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!canAfford}
                      onClick={() => handleBuy(item)}
                    >
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
