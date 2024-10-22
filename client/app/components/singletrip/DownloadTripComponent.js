import React from 'react';
import axios from 'axios';

const DownloadTripComponent = ({ tripData , tripId }) => {
    const downloadTripData = async () => {
        try {
            const response = await axios({
                url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trips/download/${tripId}`,
                method: 'GET',
                responseType: 'blob'
            });

            console.log(response.headers)

            const contentDisposition = response.headers['content-disposition'];
            let filename = `${tripData.data.name}.csv`; 
            if (contentDisposition && contentDisposition.includes('filename=')) {
                const filenamePart = contentDisposition.split('filename=')[1];
                filename = filenamePart.replace(/"/g, ''); // Clean up the filename
            }

            // Create a blob from the CSV data
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading trip data:', error);
        }
    };

    return (
        <div class="icon-div" tooltip="Download Trip" tabindex="0">
            <div class="icon-SVG">
                <svg
                    onClick={downloadTripData}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.3" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span class="icon-text">Download Trip</span>
            </div>
        </div>
    );
};

export default DownloadTripComponent;