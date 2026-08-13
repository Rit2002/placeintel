package com.rtx.placeintel.scheduler;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.repository.DriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DriveStatusScheduler {

    private final DriveRepository driveRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void updateExpiredDrives() {

        LocalDate today = LocalDate.now();

        List<Drive> expiredDrives =
                driveRepository.findByDriveDateBeforeAndStatusNot(
                        today,
                        DriveStatus.CLOSED
                );

        expiredDrives.forEach(drive ->
                drive.setStatus(DriveStatus.CLOSED)
        );

        driveRepository.saveAll(expiredDrives);
    }
}