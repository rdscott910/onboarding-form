import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AdditionalDetails() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Additional Restaurant Details</AccordionTrigger>
        <AccordionContent>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Give us an in depth overview on the history, theme and story of your restaurant:`}</label>
              <textarea className="border grow border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder="Write what you would want your best employee to know."></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Where are you located in general?`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`Not your address, but how an employee would respond. "We're on Mill Rd accross the street from the Target"`}></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Dining options (indoor/outdoor/patio, etc.):`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`Write your answer here.`}></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Parking options:`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`Write your answer here.`}></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Reservation policy:`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`Write your answer here.`}></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Are there promotional schedules?`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`Write your answer here.`}></textarea>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex flex-col justify-start w-full">
              <label className="mb-3 mt-5 block text-md font-medium text-gray-900" htmlFor="rest-history">{`Tell us about physical accessibility in your restaurant. Give practical information and insights for guests that use wheelchairs or are visually impaired, etc.`}</label>
              <textarea className="border border-gray-500 resize-none" name="rest-history" id="rest-history" placeholder={`There is wheelchair elevator available on the south side of the building, across from the H&R Block`}></textarea>
            </div>
          </div>

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

