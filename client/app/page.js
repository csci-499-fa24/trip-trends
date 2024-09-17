'use client'

import styles from "./page.module.css";
import React, {useEffect, useState} from 'react'

export function Home() {
  
  const [message, setMessage] = useState("Loading")

  console.log(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home")
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home").then(
      response => response.json()
    ).then(
      data => {
        console.log(data)
        setMessage(data.message)
      }
    )
  }, [])
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Return message from server</div>
        <div>{message}</div>
      </main>
    </div>
  );
}

export default function GetTrips() {
  
  const [message, setMessage] = useState("Loading")
  const [trips, setTripData] = useState([])

  console.log(process.env.NEXT_PUBLIC_SERVER_URL + "/get-trips")
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/get-trips").then(
      response => response.json()
    ).then(
      data => {
        setTripData(data.data)
      }
    )
  }, [])
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Get all the trips from the db</div>
        <div>{trips.map(trip => 
          <div>
            <p>Trip {trip.id}</p>
            <br></br>
            <li>{trip.name}</li>
            <li>{trip.start_date} to {trip.end_date}</li>
            <li>${trip.budget}</li>
            <br></br>
          </div>)}
        </div>
      </main>
    </div>
  );
}
