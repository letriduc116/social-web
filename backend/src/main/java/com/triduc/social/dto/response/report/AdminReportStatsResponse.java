package com.triduc.social.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportStatsResponse {
    private long totalReports;
    private long pendingReports;
    private long reviewingReports;
    private long resolvedReports;
    private long rejectedReports;

    private long userReports;
    private long postReports;
    private long commentReports;
}
