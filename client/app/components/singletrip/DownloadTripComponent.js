import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DownloadTripComponent = ({ tripData, tripId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper function to handle file downloads for different formats
    const downloadFile = async (format) => {
        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/download/${tripId}?format=${format}`,
                method: 'GET',
                responseType: 'blob'
            });

            let filename = `${tripData.data.name}.${format}`; 
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const filenamePart = contentDisposition.split('filename=')[1];
                filename = filenamePart.replace(/"/g, ''); // Clean up the filename
            }

            // Create a blob from the file data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success(`Trip data downloaded successfully as ${format.toUpperCase()}!`);
        } catch (error) {
            console.error(`Error downloading trip data in ${format} format:`, error);
            toast.error(`Error downloading trip data in ${format} format. Please try again.`);
        } finally {
            setIsModalOpen(false); // Close modal after download
        }
    };

    return (
        <div className="icon-div" tooltip="Download Trip" tabIndex="0">
            {/* Single Download Button */}
            <div className="icon-SVG">
                <svg
                    onClick={() => setIsModalOpen(true)} // Open modal on click
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.3"
                    stroke="currentColor"
                    className="size-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="icon-text">Download Trip</span>
            </div>

            {/* Modal for Format Selection */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Select Download Format</h3>
                        <button onClick={() => downloadFile('csv')}>TSV</button>
                        <button onClick={() => downloadFile('pdf')}>PDF</button>
                        <button onClick={() => downloadFile('xml')}>XML</button>
                        <button onClick={() => setIsModalOpen(false)} className="close-btn">Cancel</button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default DownloadTripComponent;
