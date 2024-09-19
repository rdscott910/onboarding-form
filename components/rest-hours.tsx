import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { PlusIcon }  from '@heroicons/react/24/outline';


export default function RestHours() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Restaurant Hours</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Monday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
                <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
                <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Monday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Tuesday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
                <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
                <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Tuesday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Wednesday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Wednesday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Thursday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Thursday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Friday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Friday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Saturday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Saturday */}
          <div className="flex flex-row w-full items-center justify-between gap-1 mb-2 overflow-auto ">
            <div className="flex flex-col gap-1 border-b-2 border-gray-200">
              <div className="flex flex-row gap-1 w-36 items-center text-center">
                <p className="peer w-96 m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">Sunday</p>
                <div className="w-auto px-1 inline-block bg-primary hover:bg-gray-600 text-white rounded-md border border-gray-200 text-sm outline-2 py-[2px] text-center">
                  <Popover>
                    <PopoverTrigger className="w-auto flex flex-row justify-center items-center align-middle"><PlusIcon className="w-3 md:w-4" /></PopoverTrigger>
                    <PopoverContent>Place content for the popover here.</PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row gap-1 justify-start w-full mb-3">
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">8:00am to 3:00pm</p>
              <p className="peer block w-fit m-auto px-3 rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500">5:00pm to 11:00pm</p>
              </div>
            </div>
          </div>
          {/* end Sunday */}
          <div className="flex justify-center mt-8 w-full">
            <button className="px-4 py-2 text-white text-lg font-light bg-blue-500 w-full rounded-md hover:bg-blue-600">
              Next
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

