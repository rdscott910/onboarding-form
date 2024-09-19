import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function RestMenu() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Restaurant Menu</AccordionTrigger>
        <AccordionContent>
          <div className="flex-col justify-center w-full">
            <div className="flex flex-col justify-start w-full mb-5">
              <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="menu-url">{`Online Ordering URL`}</label>
              <input
                id="menu-url"
                name="menu-url"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="https://"
                required
              />
            </div>
            <button className="px-4 py-2 text-white text-lg font-light bg-blue-500 w-full rounded-md hover:bg-blue-600">Next</button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
