import { Dao, DaoType } from "@polymeerxyz/lib";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { MouseEvent } from "react";
import { createSearchParams, Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useGetExplorerLink } from "@/hooks/useGetExplorerLink";
import { cn } from "@/lib/utils";
import { toReadableAmount } from "@/lib/utils/amount";

interface Props {
  dao: Dao;
}

const getLabel = (type: DaoType) => {
  switch (type) {
    case DaoType.DEPOSIT: {
      return "Locking";
    }
    case DaoType.WITHDRAW: {
      return "Unlocking";
    }
  }
};

export function DaoRow({ dao }: Props) {
  const explorerLink = useGetExplorerLink(dao.hash, "transaction");
  const navigate = useNavigate();

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate({
      pathname: "withdraw",
      search: createSearchParams({
        hash: dao.hash,
        amount: dao.amount.toString(),
        type: dao.type,
        timestamp: `${dao.timestamp}`,
        withBack: "true",
      }).toString(),
    });
  };

  return (
    <Button className="flex h-14 w-full items-center space-x-2 rounded-md px-4" variant="ghost" onClick={onClick}>
      <div className="flex flex-1 flex-col items-start">
        <p className="text-base font-semibold">{getLabel(dao.type)}</p>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            dao.type === DaoType.DEPOSIT ? "text-green-500" : "text-red-500",
          )}
        >
          {`${toReadableAmount(dao.amount)} CKB`}
        </p>
      </div>
      <Button variant="link" className="p-0 text-muted-foreground" asChild>
        <Link to={explorerLink} target="_blank" className="text-xs">
          {format(dao.timestamp, "P")}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Button>
  );
}
