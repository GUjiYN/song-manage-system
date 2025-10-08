"use client";

import {Button} from "@/components/ui/button";
import {toast} from "sonner";

export default function Home() {
    return (
        <div className={"p-16"}>
            <Button className={"hover:bg-green-500 action:bg-blue-500"}>
                Hello
            </Button>
        </div>
    )
}