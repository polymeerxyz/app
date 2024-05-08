import { zodResolver } from "@hookform/resolvers/zod";
import { FeeRate } from "@polymeerxyz/lib";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLedgerDaoDeposit } from "@/hooks/useLedgerDaoDeposit";
import { useLocalDaoDeposit } from "@/hooks/useLocalDaoDeposit";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { toReadableAmount } from "@/lib/utils/amount";
import { useLockStore } from "@/stores/lock";
import { useWalletStore } from "@/stores/wallet";

const FormSchema = z.object({
  amount: z.string(),
});

export default function DepositPage() {
  const [loading, setLoading] = useState(false);
  const lock = useLockStore((s) => s.lock);
  const activeWallet = useWalletStore((s) => s.getActiveWallet("nervosnetwork"));
  const { balance, token } = useTokenInfo("ckb");
  const ledgerDaoDeposit = useLedgerDaoDeposit();
  const localDaoDeposit = useLocalDaoDeposit();

  const isLocal = useMemo(
    () => activeWallet!.type === "private-key" || activeWallet!.type === "mnemonic",
    [activeWallet],
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);
      if (isLocal) {
        await localDaoDeposit(
          {
            amount: data.amount,
          },
          FeeRate.NORMAL,
        );
      } else {
        await ledgerDaoDeposit(
          {
            amount: data.amount,
          },
          FeeRate.NORMAL,
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <div className="!mt-1 flex">
                      <Button
                        className="ml-auto h-4 text-xs text-destructive/80"
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          form.setValue("amount", toReadableAmount(balance.available));
                        }}
                      >
                        {`Max: ${toReadableAmount(balance.available)} CKB`}
                      </Button>
                    </div>
                  </FormItem>
                );
              }}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading || lock[activeWallet!.id]}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}
