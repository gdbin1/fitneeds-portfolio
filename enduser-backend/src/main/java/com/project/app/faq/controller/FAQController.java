package com.project.app.faq.controller;

import com.project.app.faq.dto.FAQDto;
import com.project.app.faq.service.FAQService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/faq")
public class FAQController {

    private final FAQService faqService;

    public FAQController(FAQService faqService) {
        this.faqService = faqService;
    }

    @GetMapping
    public List<FAQDto> getUserFaqList() {
        return faqService.getUserFaqList();
    }

    @GetMapping("/{postId}")
    public FAQDto getUserFaqDetail(@PathVariable Long postId) {
        return faqService.getUserFaqDetail(postId);
    }
}


