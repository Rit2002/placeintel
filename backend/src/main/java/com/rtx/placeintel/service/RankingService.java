package com.rtx.placeintel.service;

import com.rtx.placeintel.entity.Application;
import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.StudentProfile;
import org.springframework.stereotype.Service;

import java.util.List;

/*
* - Rule based ranking is the phase 1 of filtering out the applied candidates to drive
* */
@Service
public class RankingService {

    private static final double SKILL_WEIGHT = 0.40;
    private static final double CGPA_WEIGHT = 0.25;
    private static final double ACADEMICS_WEIGHT = 0.20;
    private static final double BACKLOG_WEIGHT = 0.15;



    public double calculateScore(StudentProfile profile, Drive drive) {


        double skillScore = calculateSkillOverlap(profile, drive);
        double cgpaScore = calculateCgpaScore(profile);
        double academicsScore = calculateAcademicsScore(profile);
        double backlogScore = calculateBacklogScore(profile, drive);

        return (skillScore * SKILL_WEIGHT)
                + (cgpaScore * CGPA_WEIGHT)
                + (academicsScore * ACADEMICS_WEIGHT)
                + (backlogScore * BACKLOG_WEIGHT);
    }



    /*
    * - Matches how many dive requirement a candidate meets, according to JD
    * */
    private double calculateSkillOverlap(StudentProfile profile, Drive drive) {

        List<String> requiredSkills = drive.getRequiredSkills();
        List<String> studentSkills = profile.getSkills();

        if (requiredSkills.isEmpty()) {
            return 100.0; // no skills specified means nothing to penalize against
        }

        if (studentSkills == null || studentSkills.isEmpty()) {
            return 0.0;
        }

        // Count the required skills that are present in the student's skill set
        long matchCount = requiredSkills.stream()
                .filter(skill -> studentSkills.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(skill)))
                .count();

        return (matchCount / (double) requiredSkills.size()) * 100.0;
    }




    private double calculateCgpaScore(StudentProfile profile) {

        if (profile.getCgpa() == null) {
            return 0.0;
        }

        return Math.min((profile.getCgpa() / 10.0) * 100.0, 100.0);
    }



    private double calculateAcademicsScore(StudentProfile profile) {

        if (profile.getTenthPercentage() == null && profile.getTwelfthPercentage() == null) {
            return 0.0;
        }

        double tenth = profile.getTenthPercentage() != null ? profile.getTenthPercentage() : 0.0;
        double twelfth = profile.getTwelfthPercentage() != null ? profile.getTwelfthPercentage() : 0.0;

        // average the two, treating a missing one as 0 rather than
        // skewing the average by silently dropping it
        int count = (profile.getTenthPercentage() != null ? 1 : 0)
                + (profile.getTwelfthPercentage() != null ? 1 : 0);

        return (tenth + twelfth) / count;
    }




    private double calculateBacklogScore(StudentProfile profile, Drive drive) {

        int backlogs = profile.getActiveBacklog();
        int maxAllowed = drive.getMaxAllowedBacklogs();

        if (backlogs == 0) {
            return 100.0;
        }

        if (backlogs > maxAllowed) {
            return 0.0; // shouldn't happen — apply() already blocks this — defensive only
        }

        /*
        * +1 to maxAllowed because someone with backlogs equal to maxAllowed will give zero score
        *   EX : 1 - (2/2) = 0.0 -> 0
        *
        * 1.0 - badness_fraction :- To flip the result from "how bad" into "how good."
        * */
        return (1.0 - ((double) backlogs / (maxAllowed + 1))) * 100.0;
    }
}