package com.ieum.admin.notice.adapter.in.web;

import com.ieum.admin.notice.application.port.in.CreateNoticeUseCase;
import com.ieum.admin.notice.application.port.in.DeleteNoticeUseCase;
import com.ieum.admin.notice.application.port.in.GetAdminNoticeListUseCase;
import com.ieum.admin.notice.application.port.in.UpdateNoticeUseCase;
import com.ieum.admin.notice.domain.AdminNotice;
import com.ieum.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import com.ieum.admin.notice.adapter.in.web.dto.NoticeSaveRequest;

/**
 * 관리자용 공지사항 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출, 원시값만 전달
 */
@Tag(name = "[관리자] 공지사항 관리", description = "공지사항 작성 / 수정 / 삭제")
@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class NoticeAdminController {

    private final CreateNoticeUseCase createNoticeUseCase;
    private final UpdateNoticeUseCase updateNoticeUseCase;
    private final DeleteNoticeUseCase deleteNoticeUseCase;
    private final GetAdminNoticeListUseCase getAdminNoticeListUseCase;

    /**
     * 관리자용 공지 목록 조회 (API_ADM_0060)
     */
    @Operation(summary = "관리자용 공지 목록 조회", description = "전체 공지사항을 관리자 화면에서 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminNotice>>> getAdminNotices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isPinned,
            @RequestParam(required = false) Boolean isPopup,
            @RequestParam(required = false) Boolean isPushed,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(
                getAdminNoticeListUseCase.getAdminNotices(page, size, searchType, keyword, isPinned,
                        isPopup, isPushed, status)));
    }


    /**
     * 공지사항 작성 (API_ADM_0061)
     */
    @Operation(summary = "공지사항 작성", description = "관리자가 새 공지사항을 작성합니다. 첨부파일 포함 가능.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "작성 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "관리자 권한 필요")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AdminNotice>> createNotice(
            @ModelAttribute NoticeSaveRequest request,
            @RequestParam(required = false) List<MultipartFile> files) {
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        createNoticeUseCase.create(request.toCreateCommand(files))));
    }

    /**
     * 공지사항 수정 (API_ADM_0062)
     */
    @Operation(summary = "공지사항 수정", description = "기존 공지사항을 수정합니다. 첨부파일 추가/삭제 가능.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @PutMapping(value = "/{noticeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AdminNotice>> updateNotice(
            @Parameter(description = "공지사항 ID", required = true, example = "1") @PathVariable Long noticeId,
            @ModelAttribute NoticeSaveRequest request,
            @RequestParam(required = false) List<MultipartFile> newFiles,
            @RequestParam(required = false) List<Long> deleteFileIds) {
            
        return ResponseEntity.ok(ApiResponse.success(
                updateNoticeUseCase.update(request.toUpdateCommand(noticeId, newFiles, deleteFileIds))));
    }

    /**
     * 공지사항 삭제 (API_ADM_0063)
     */
    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다. 첨부파일도 함께 삭제됩니다.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(
            @Parameter(description = "공지사항 ID", required = true, example = "1") @PathVariable Long noticeId) {
        deleteNoticeUseCase.delete(noticeId);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
