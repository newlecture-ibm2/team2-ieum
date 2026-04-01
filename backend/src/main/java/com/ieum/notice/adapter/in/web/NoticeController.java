package com.ieum.notice.adapter.in.web;

import com.ieum.attachment.application.port.in.LoadAttachmentUseCase;
import com.ieum.global.response.ApiResponse;
import com.ieum.notice.application.port.in.GetNoticeDetailUseCase;
import com.ieum.notice.application.port.in.GetNoticeListUseCase;
import com.ieum.notice.application.port.in.GetPopupNoticeUseCase;
import com.ieum.notice.domain.model.Notice;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * 사용자용 공지사항 컨트롤러 (Input Adapter)
 * - 로직 없이 UseCase만 호출
 */
@Tag(name = "공지사항", description = "공지사항 조회 (CRUD는 Admin API)")
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final GetNoticeListUseCase getNoticeListUseCase;
    private final GetNoticeDetailUseCase getNoticeDetailUseCase;
    private final GetPopupNoticeUseCase getPopupNoticeUseCase;
    private final LoadAttachmentUseCase loadAttachmentUseCase;

    /**
     * 공지사항 목록 조회 (API_NTC_0010)
     */
    @Operation(summary = "공지사항 목록 조회", description = "검색, 페이지네이션으로 공지사항 목록을 조회합니다. 비회원 이용 가능.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notice>>> getNotices(
            @Parameter(description = "검색 유형 (title/content/all)", example = "all")
            @RequestParam(required = false) String searchType,
            @Parameter(description = "검색 키워드")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "페이지 번호", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "페이지 크기", example = "10")
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                getNoticeListUseCase.getNotices(searchType, keyword,
                        PageRequest.of(page - 1, size, Sort.by("isPinned").descending()
                                .and(Sort.by("createdAt").descending())))));
    }

    /**
     * 공지사항 상세 조회 (API_NTC_0011)
     */
    @Operation(summary = "공지사항 상세 조회", description = "이전글/다음글 정보 포함")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    @GetMapping("/{noticeId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNoticeDetail(
            @Parameter(description = "공지사항 ID", required = true, example = "1")
            @PathVariable Long noticeId) {
        return ResponseEntity.ok(ApiResponse.success(
                getNoticeDetailUseCase.getNoticeDetail(noticeId)));
    }

    /**
     * 팝업용 공지 조회 (API_NTC_0020)
     */
    @Operation(summary = "팝업 공지 조회", description = "메인 화면 진입 시 isPopup=true인 최신 공지 1건 반환")
    @GetMapping("/popup")
    public ResponseEntity<ApiResponse<Notice>> getPopupNotice() {
        return ResponseEntity.ok(ApiResponse.success(
                getPopupNoticeUseCase.getPopupNotice()));
    }

    /**
     * 첨부파일 다운로드 (API_NTC_0030)
     */
    @Operation(summary = "첨부파일 다운로드", description = "공지사항에 첨부된 파일을 다운로드합니다.")
    @GetMapping("/{noticeId}/files/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long noticeId,
            @PathVariable Long fileId) {
        Resource resource = loadAttachmentUseCase.download(fileId);
        String encodedName = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedName + "\"")
                .body(resource);
    }
}
