import { Link, Outlet, useParams } from "react-router-dom"
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import Header from "../Header.jsx"
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js"
import ErrorBlock from "../UI/ErrorBlock.jsx"
import LoadingIndicator from "../UI/LoadingIndicator.jsx"
import { useNavigate } from "react-router-dom"
import Modal from "../UI/Modal.jsx"
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)

  function handleStartDeleting() {
    setIsDeleting(true)
  }
  function handleStopDeleting() {
    setIsDeleting(false)
  }

  const { id } = useParams()
  const navigate = useNavigate()

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deletionError,
  } = useMutation({
    mutationFn: ({ signal }) => deleteEvent({ signal, id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      })
      navigate("/events")
    },
  })

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  })

  let content
  if (isPending) {
    content = <LoadingIndicator />
  }
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
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>

        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="event image" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
          <h2>Are you sure?</h2>
          <p>Delete events cannot be undone</p>
          {isPendingDeletion && <LoadingIndicator />}
          {!isPendingDeletion && (
            <div className="form-actions">
              <button className="button-text " onClick={handleStopDeleting}>
                Cancel
              </button>
              <button className="button" onClick={mutate}>
                Delete
              </button>
            </div>
          )}
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event"
              message={deletionError.info?.message}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  )
}
