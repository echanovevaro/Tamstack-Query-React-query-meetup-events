import {
  Link,
  useNavigate,
  redirect,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom"

import Modal from "../UI/Modal.jsx"
import EventForm from "./EventForm.jsx"
import { fetchEvent, queryClient, updateEvent } from "../../utils/http.js"
import { useQuery } from "@tanstack/react-query"
import ErrorBlock from "../UI/ErrorBlock.jsx"
export default function EditEvent() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const submit = useSubmit()
  const { id } = useParams()

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000,
  })

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async (data) => {
  //     const newEvent = data.event
  //     await queryClient.cancelQueries(["events", id])
  //     const previousData = queryClient.getQueryData(["events", id])
  //     queryClient.setQueryData(["events", id], newEvent)
  //     return { previousData }
  //   },
  //   onError: (error, formData, context) => {
  //     queryClient.setQueryData(["events", id], context.previousData)
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events"])
  //   },
  // })

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" })
  }

  function handleClose() {
    navigate("../")
  }
  let content

  if (isError) {
    content = (
      <ErrorBlock
        title="An error ocurred"
        message={error.info?.message || "Failed to fetch event"}
      />
    )
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {navigation.state === "submitting" ? (
          <p>Updating event...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    )
  }

  return <Modal onClose={handleClose}>{content}</Modal>
}

export async function loader({ params }) {
  const { id } = params
  await queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  })
  console.log("loader")
  return null
}

export async function action({ params, request }) {
  console.log(request)
  const fomData = await request.formData()
  const updatedEventData = Object.fromEntries(fomData.entries())
  await updateEvent({ id: params.id, event: updatedEventData })
  await queryClient.invalidateQueries(["events"])

  return redirect("../")
}
