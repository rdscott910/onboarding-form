import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function RestDetails() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Restaurant Details</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-row items-center justify-between gap-1">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-xs font-medium " htmlFor="rest-name">{`Restaurant's Name`}</label>
              <input
                id="rest-name"
                name="rest-name"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 py-[9px] bg-gray-900 pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Restaurant's Name"
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-xs font-medium " htmlFor="rest-address">{`Restaurant's Street Address`}</label>
              <input
                id="rest-address"
                name="rest-address"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 bg-gray-900 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Restaurant's Street Address"
                required
                autoComplete="off"
              />
            </div>
          </div>
          {/* end row 1 */}

          <div className="flex flex-row items-center justify-between gap-1">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-xs font-medium " htmlFor="rest-website">{`Restaurant's Website`}</label>
              <input
                id="rest-website"
                name="rest-website"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 bg-gray-900 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Restaurant's Website"
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-xs font-medium " htmlFor="rest-phone">{`Restaurant's Phone Number`}</label>
              <input
                id="rest-phone"
                name="rest-phone"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 bg-gray-900 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Restaurant's Phone Number"
                required
                autoComplete="off"
              />
            </div>
          </div>
          {/* end row 2 */}

          <div className="flex flex-row items-center justify-between gap-1">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-xs font-medium " htmlFor="rest-name-internal">{`Internal Restaurant Name`}</label>
              <input
                id="rest-name-internal"
                name="rest-name-internal"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 bg-gray-900 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Internal Restaurant Name"
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col justify-start w-full">
              <label
                className="mb-3 mt-5 block text-xs font-medium "
                htmlFor="phone-order-avg"
              >{`Your monthly average for orders placed by phone`}</label>
              <input
                id="phone-order-avg"
                name="phone-order-avg"
                type="text"
                className="peer block w-full rounded-md border border-gray-200 bg-gray-900 py-[9px] pl-5 text-sm outline-2 placeholder:text-gray-500"
                placeholder="Your monthly average for orders placed by phone"
                required
                autoComplete="off"
              />
            </div>
          </div>
          {/* end row 3 */}

          <div className="flex justify-center mt-8 w-full">
            <button className="px-4 py-2 text-white text-lg font-light bg-blue-500 w-full rounded-md hover:bg-blue-600">Next</button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
